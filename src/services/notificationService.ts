import { notification } from 'antd'
import type { NotificationArgsProps } from 'antd'

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
    this.success('环境创建成功', `环境 "${name}" 已创建`)
  }

  static environmentDeleted(name: string) {
    this.info('环境删除成功', `环境 "${name}" 已删除`)
  }

  static environmentSwitched(name: string) {
    this.info('环境切换成功', `当前环境: "${name}"`)
  }
}
