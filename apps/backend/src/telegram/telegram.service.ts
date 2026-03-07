import { Injectable } from '@nestjs/common';
import { AutomakerService, OnProgressCallback } from '../automaker/automaker.service';

export interface ParsedMessage {
  title: string;
  description: string;
}

@Injectable()
export class TelegramService {
  constructor(private readonly automakerService: AutomakerService) {}

  /**
   * Lấy toàn bộ nội dung tin nhắn (đã bỏ @mention) dùng làm description.
   * Title cố định "Chỉnh sửa hệ thống".
   */
  parseMessageForAutomaker(text: string, botUsername?: string): ParsedMessage {
    let content = text.trim();
    if (botUsername) {
      const mention = `@${botUsername.replace('@', '')}`;
      content = content.replace(new RegExp(mention, 'gi'), '').trim();
    }
    return {
      title: 'Chỉnh sửa hệ thống',
      description: content || '(Không có nội dung)',
    };
  }

  /**
   * Kiểm tra tin nhắn có mention bot không (qua entities hoặc text chứa @username).
   */
  isBotMentioned(text: string | undefined, botUsername: string): boolean {
    if (!text) return false;
    const mention = `@${botUsername.replace('@', '')}`;
    return text.toLowerCase().includes(mention.toLowerCase());
  }

  /**
   * Gửi tin nhắn đã parse lên Automaker API.
   * onProgress: gọi khi có content từ agent-output để gửi cập nhật tình hình cho user.
   */
  async sendToAutomaker(
    title: string,
    description: string,
    onProgress?: OnProgressCallback,
  ) {
    return this.automakerService.createWithTitleAndDescription(
      { title, description },
      onProgress,
    );
  }
}
