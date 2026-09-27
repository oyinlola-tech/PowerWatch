import { DeviceRepository } from '../../../repositories/device.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class ListDevicesQuery {
  constructor(
    private readonly deviceRepository: DeviceRepository = new DeviceRepository(),
  ) {}

  async execute(userId: string) {
    const devices = await this.deviceRepository.findByUserId(userId);
    return devices.map((d) => ({
      id: d.id,
      deviceName: d.deviceName,
      deviceType: d.deviceType,
      browser: d.browser,
      platform: d.platform,
      lastActive: d.lastActive,
      createdAt: d.createdAt,
    }));
  }
}

export class RemoveDeviceCommand {
  constructor(
    private readonly deviceRepository: DeviceRepository = new DeviceRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    deviceId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const device = await this.deviceRepository.findByIdAndUserId(deviceId, userId);
    if (!device) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    await this.deviceRepository.delete(deviceId);

    await this.auditRepository.create({
      userId,
      action: 'DEVICE_REMOVE',
      entityType: 'Device',
      entityId: deviceId,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });

    return { message: 'Device removed successfully.' };
  }
}
