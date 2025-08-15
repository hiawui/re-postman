import React from 'react'
import { Button, Dropdown } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const FeedbackSwitcher: React.FC = () => {
  const { t } = useTranslation()

  // 反馈菜单配置
  const feedbackMenuItems = [
    {
      key: 'chrome-store',
      label: t('feedback.chromeWebStore'),
      onClick: () => {
        // 直接跳转到Chrome Web Store的评价页面
        window.open(
          'https://chromewebstore.google.com/detail/repostman/kadldemjkpblchiefobecggkimcjmfeg/reviews',
          '_blank'
        )
      },
    },
    {
      key: 'github',
      label: t('feedback.githubIssues'),
      onClick: () => {
        window.open('https://github.com/hiawui/re-postman/issues', '_blank')
      },
    },
  ]

  return (
    <Dropdown
      menu={{ items: feedbackMenuItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button icon={<QuestionCircleOutlined />}>
        {t('feedback.feedback')}
      </Button>
    </Dropdown>
  )
}

export default FeedbackSwitcher
