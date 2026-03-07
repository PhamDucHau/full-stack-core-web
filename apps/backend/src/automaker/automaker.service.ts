import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AutomakerCreatePayload {
  title: string;
  description: string;
}

/** Callback để gửi nội dung agent-output (cập nhật tình hình) cho user. */
export type OnProgressCallback = (content: string) => void | Promise<void>;

export interface AutomakerApiResponse {
  success?: boolean;
  id?: string;
  message?: string;
  [key: string]: unknown;
}

function generateFeatureId(): string {
  const t = Date.now();
  const r = Math.random().toString(36).slice(2, 10);
  return `feature-${t}-${r}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class AutomakerService {
  private readonly logger = new Logger(AutomakerService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl =
      this.configService.get<string>('AUTOMAKER_API_URL') ||
      'http://103.82.38.96:3008';
  }

  /**
   * Gửi title và description lên API Automaker (tạo feature).
   * onProgress: gọi khi có content từ agent-output để cập nhật tình hình cho user.
   */
  async createWithTitleAndDescription(
    payload: AutomakerCreatePayload,
    onProgress?: OnProgressCallback,
  ): Promise<AutomakerApiResponse> {
    this.logger.log(
      `[CREATE] Bắt đầu tạo feature | title="${payload.title}" | description(length)=${payload.description?.length ?? 0}`,
    );
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/features/create`;
    const projectPath =
      this.configService.get<string>('AUTOMAKER_PROJECT_PATH') ||
      '/projects/full-stack-core-web';
    const apiKey = this.configService.get<string>('AUTOMAKER_API_KEY') || 'c86f7919-f45a-45b0-b7d2-bfd30ff223cb';

    const body = {
      projectPath,
      feature: {
        title: payload.title,
        category: 'Uncategorized',
        description: payload.description || payload.title,
        images: [],
        imagePaths: [],
        textFilePaths: [],
        skipTests: true,
        model: 'opus',
        thinkingLevel: 'none',
        reasoningEffort: 'none',
        priority: 2,
        planningMode: 'skip',
        requirePlanApproval: false,
        dependencies: [],
        workMode: 'current',
        titleGenerating: false,
        status: 'backlog',
        id: generateFeatureId(),
      },
    };

    const headers = this.getHeaders(apiKey);

    try {
      this.logger.log(`[CREATE] POST ${url}`);
      const response = await firstValueFrom(
        this.httpService.post(url, body, {
          headers,
          timeout: 60000,
        }),
      );
      const data = response.data as AutomakerApiResponse & { feature?: { id?: string } };
      const featureId = data?.feature?.id ?? (data?.id as string) ?? body.feature.id;
      this.logger.log(`[CREATE] Thành công | featureId=${featureId}`);

      if (onProgress) {
        try {
          await onProgress('Đã nhận được yêu cầu và đang tiến hành xử lý.');
        } catch (e) {
          this.logger.warn(`[CREATE] onProgress (task received): ${(e as Error)?.message}`);
        }
      }

      this.logger.log(
        `[POLL] Bắt đầu poll get + agent-output mỗi 2s cho tới status=waiting_approval`,
      );
      await this.pollUntilWaitingApproval(
        projectPath,
        featureId,
        apiKey,
        onProgress,
      );
      this.logger.log(`[POLL] Đã đạt waiting_approval | featureId=${featureId}`);

      this.logger.log(`[UPDATE] Gọi update status=verified | featureId=${featureId}`);
      await this.updateFeatureStatus(featureId, { status: 'verified' });
      this.logger.log(`[UPDATE] Thành công | featureId=${featureId}`);

      this.logger.log(`[CREATE-PR] Gọi create-pr để merge lên main`);
      await this.createPr(projectPath, apiKey);
      this.logger.log(`[CREATE-PR] Thành công`);

      return response.data as AutomakerApiResponse;
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      this.logger.error(
        `[CREATE] Lỗi | status=${status} | message=${error.message} | data=${JSON.stringify(data ?? {})}`,
      );
      throw new Error(
        `Automaker API: ${status || error.message}. ${JSON.stringify(data || {})}`,
      );
    }
  }

  private getHeaders(apiKey: string | undefined): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: '*/*',
    };
    if (apiKey) headers['x-api-key'] = apiKey;
    return headers;
  }

  /**
   * GET feature: POST /api/features/get với body { projectPath, featureId }.
   */
  private async getFeature(
    projectPath: string,
    featureId: string,
    apiKey: string,
  ): Promise<{ feature?: { status?: string }; status?: string }> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/features/get`;
    const response = await firstValueFrom(
      this.httpService.post(
        url,
        { projectPath, featureId },
        { headers: this.getHeaders(apiKey), timeout: 15000 },
      ),
    );
    return (response.data || {}) as { feature?: { status?: string }; status?: string };
  }

  /**
   * Gọi POST /api/features/agent-output, trả về { success, content }.
   */
  private async callAgentOutput(
    projectPath: string,
    featureId: string,
    apiKey: string,
  ): Promise<{ success?: boolean; content?: string }> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/features/agent-output`;
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { projectPath, featureId },
          { headers: this.getHeaders(apiKey), timeout: 60000 },
        ),
      );
      const raw = response.data as any;
      const content =
        typeof raw === 'string'
          ? raw
          : (raw?.content ?? raw?.data?.content ?? '') || '';
      const success = typeof raw === 'object' ? raw?.success !== false : true;
      this.logger.log(
        `[AGENT-OUTPUT] content length=${content.length} | hasDescription=${content.includes('description')}`,
      );
      return { success, content: content || undefined };
    } catch (err: any) {
      this.logger.warn(
        `[AGENT-OUTPUT] Lỗi (bỏ qua) | featureId=${featureId} | ${err?.message}`,
      );
      return {};
    }
  }

  /**
   * Poll get + agent-output mỗi 2s; dừng khi status === "waiting_approval".
   * Mỗi lần có content từ agent-output thì gọi onProgress(content).
   */
  private async pollUntilWaitingApproval(
    projectPath: string,
    featureId: string,
    apiKey: string,
    onProgress?: OnProgressCallback,
  ): Promise<void> {
    const targetStatus = 'waiting_approval';
    let pollCount = 0;
    const minPollsBeforeExit = 3;
    for (;;) {
      pollCount++;
      const [getData, agentData] = await Promise.all([
        this.getFeature(projectPath, featureId, apiKey),
        this.callAgentOutput(projectPath, featureId, apiKey),
      ]);
      const status = getData?.feature?.status ?? getData?.status;
      this.logger.log(
        `[POLL] featureId=${featureId} | status=${status} | poll#=${pollCount} | contentLen=${agentData?.content?.length ?? 0}`,
      );

      if (agentData?.content && onProgress) {
        try {
          await onProgress(agentData.content);
        } catch (e) {
          this.logger.warn(`[POLL] onProgress error: ${(e as Error)?.message}`);
        }
      }

      if (status === targetStatus && pollCount >= minPollsBeforeExit) return;
      await delay(2000);
    }
  }

  /**
   * POST /api/features/update với body { projectPath, featureId, updates }.
   */
  private async updateFeatureStatus(
    featureId: string,
    updates: { status: string },
  ): Promise<AutomakerApiResponse> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/features/update`;
    const projectPath =
      this.configService.get<string>('AUTOMAKER_PROJECT_PATH') ||
      '/projects/full-stack-core-web';
    const apiKey =
      this.configService.get<string>('AUTOMAKER_API_KEY') ||
      'c86f7919-f45a-45b0-b7d2-bfd30ff223cb';

    const body = { projectPath, featureId, updates };

    const response = await firstValueFrom(
      this.httpService.post(url, body, {
        headers: this.getHeaders(apiKey),
        timeout: 30000,
      }),
    );
    return response.data as AutomakerApiResponse;
  }

  /**
   * POST /api/worktree/create-pr - tạo PR merge lên main.
   */
  private async createPr(projectPath: string, apiKey: string): Promise<unknown> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/worktree/create-pr`;
    const worktreePath =
      this.configService.get<string>('AUTOMAKER_WORKTREE_PATH') || projectPath;
    const body = {
      worktreePath,
      projectPath,
      prTitle: 'main',
      prBody: 'Changes from branch main',
      baseBranch: 'main',
      draft: false,
    };
    const response = await firstValueFrom(
      this.httpService.post(url, body, {
        headers: this.getHeaders(apiKey),
        timeout: 60000,
      }),
    );
    return response.data;
  }
}
