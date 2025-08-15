import React from 'react'
import { Layout, Button, Space, Typography } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import FeedbackSwitcher from '../FeedbackSwitcher/FeedbackSwitcher'

const { Header } = Layout
const { Title } = Typography

interface AppHeaderProps {
  onEnvironmentClick: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = React.memo(
  ({ onEnvironmentClick }) => {
    const { t } = useTranslation()

    return (
      <Header className="app-header">
        <div className="header-content">
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            RePostman
          </Title>
          <Space>
            <LanguageSwitcher />
            <Button icon={<EnvironmentOutlined />} onClick={onEnvironmentClick}>
              {t('navigation.environments')}
            </Button>
            <FeedbackSwitcher />
          </Space>
        </div>
      </Header>
    )
  }
)

AppHeader.displayName = 'AppHeader'
