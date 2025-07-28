import { notification } from 'antd'
import type { NotificationArgsProps } from 'antd'
import i18n from '@/i18n'

export class NotificationService {
  static success(
    message: string,
    description?: string,
    options?: Partial<NotificationArgsProps>
  ) {
    notification.success({
      message,
      description,
      placement: 'topRight',
      duration: 3,
      ...options,
    })
  }

  static error(
    message: string,
    description?: string,
    options?: Partial<NotificationArgsProps>
  ) {
    notification.error({
      message,
      description,
      placement: 'topRight',
      duration: 5,
      ...options,
    })
  }

  static warning(
    message: string,
    description?: string,
    options?: Partial<NotificationArgsProps>
  ) {
    notification.warning({
      message,
      description,
      placement: 'topRight',
      duration: 4,
      ...options,
    })
  }

  static info(
    message: string,
    description?: string,
    options?: Partial<NotificationArgsProps>
  ) {
    notification.info({
      message,
      description,
      placement: 'topRight',
      duration: 3,
      ...options,
    })
  }

  // 环境变量相关通知
  static environmentCreated(name: string) {
    this.success(
      i18n.t('services.environmentCreated'),
      `${i18n.t('environments.environmentName')} "${name}" ${i18n.t('services.environmentCreated')}`
    )
  }

  static environmentDeleted(name: string) {
    this.info(
      i18n.t('services.environmentDeleted'),
      `${i18n.t('environments.environmentName')} "${name}" ${i18n.t('services.environmentDeleted')}`
    )
  }
}
