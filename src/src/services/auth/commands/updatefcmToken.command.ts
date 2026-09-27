import { DeviceRepository } from '../../../repositories/device.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';

export class UpdateFcmTokenCommand {
  constructor(
    private readonly deviceRepository: DeviceRepository = new DeviceRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    userId: string,
    data: {
      fcmToken?: string | null | undefined;
      deviceName?: string | null | undefined;
      deviceType?: 'ANDROID' | 'IOS' | 'WEB' | null | undefined;
      browser?: string | null | undefined;
      platform?: string | null | undefined;
    },
  ) {
    const device = await this.deviceRepository.upsertFcmToken(userId, {
      fcmToken: data.fcmToken ?? null,
      deviceName: data.deviceName ?? null,
      deviceType: data.deviceType ?? null,
      browser: data.browser ?? null,
      platform: data.platform ?? null,
    });

    await this.auditRepository.create({
      userId,
      action: 'DEVICE_REGISTER',
      entityType: 'Device',
      entityId: device.id,
    });

    return {
      id: device.id,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      fcmToken: device.fcmToken ? '***' : null,
      browser: device.browser,
      platform: device.platform,
      lastActive: device.lastActive,
    };
  }
}
