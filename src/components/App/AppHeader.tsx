import React from 'react'
import { Layout, Button, Space, Typography } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'

const { Header } = Layout
const { Title } = Typography

interface AppHeaderProps {
  onEnvironmentClick: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = React.memo(
  ({ onEnvironmentClick }) => {
    return (
      <Header className="app-header">
        <div className="header-content">
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            RePostman
          </Title>
          <Space>
            <Button
              icon={<EnvironmentOutlined />}
              size="small"
              onClick={onEnvironmentClick}
            >
              Environment
            </Button>
          </Space>
        </div>
      </Header>
    )
  }
)

AppHeader.displayName = 'AppHeader'
