import React from 'react'
import { Redirect, Route } from 'react-router-dom'

import { useAppContext } from '~/components/app/context'
import { isLogin } from '~/core/user'
import { getLink } from '~/core/utils'

import { useAppConfig, useUserInfo } from './hooks'

// 用于读取自定义配置
export const ConfigRoute = (props) => {
  useAppConfig()
  return props.children
}

// 用于登录拦截
export const PrivateRoute = ({ children, ...rest }) => {
  const { custom, appInfo } = useAppContext()
  const { orgId, type } = appInfo

  const isLoginApp = isLogin(type, custom.isolation)
  const loginLink = getLink('login', orgId)

  useUserInfo({
    isLogin: isLoginApp,
  })

  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLoginApp ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: loginLink,
              state: { from: location },
            }}
          />
        )
      }
    />
  )
}