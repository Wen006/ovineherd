/**
 * 由于后端接口设计很特殊
 * 因此将页面所有要调的接口，全部封装在这里
 */

import { ReqOption } from '@core/utils/request/types'
import { setStore } from '@ovine/core/lib/utils/store'

import { relation, storeKey } from '../constants'
import { ApiName, ApiType } from '../types'
import { getOrgId, getOrgUniType } from '../utils'
import { ApiData, getReqOption, requestApi, requestByOption } from './utils'

// 根据 token 获取用户信息
export function userSelfInfoApi(data: ApiData, option?: ReqOption) {
  return requestApi(ApiType.user, ApiName.one, data, option)
}

export function userSelfInfoReqOpt(data: ApiData, option?: ReqOption) {
  const reqOption = getReqOption(
    {
      apiType: ApiType.user,
      apiName: ApiName.one,
      ...data,
    },
    option
  )

  return reqOption
}

// 系统用户登录
export function sysUserLoginApi(option: ApiData) {
  return requestApi(
    ApiType.user,
    ApiName.login,
    {
      ...option,
      onlyData: false,
    },
    {
      // 不提示错误信息
      onSuccess: (source) => {
        source.code = source.status
        source.status = 0
        return source
      },
    }
  )
}

export function sysUserLogoutApi() {
  //
}

// 获取 平台配置
export function sysConfigApi() {
  // 平台配置由系统 初始化生成
  return requestByOption({
    onlyOne: true,
    apiName: ApiName.list,
    ...relation.sys.sysInfo,
  }).then((sysInfo) => {
    setStore(storeKey.sysInfo, sysInfo)
    return sysInfo
  })
}

// 获取 组织配置
export function orgConfigApi(option: { orgId: string }) {
  return requestByOption({
    ...relation.org.entity,
    apiName: ApiName.one,
    id: option.orgId,
  }).then((source) => {
    const orgInfo = source.relation1_data
    setStore(storeKey.orgInfo, orgInfo)
    return orgInfo
  })
}

// 注册一个 组织，提交到 平台管理员审核列表
export function orgRegisterApi() {
  //
}

// 平台管理员 添加一个组织
export async function sysCreateOrgApi(option: any) {
  const { username, password, ...rest } = option

  const ids = {
    orgAdmUserId: '',
    orgInfoId: '',
    orgId: '',
  }

  try {
    // 添加一个 组织对应配置
    const { id: orgInfoId } = await requestByOption({
      ...rest,
      ...relation.org.orgInfo,
      apiName: ApiName.add,
    })
    ids.orgInfoId = `${orgInfoId}`

    // 创建一个组织， 并将 配置/用户 关联到该组织
    const { id: orgId } = await requestByOption({
      ...relation.org.entity,
      apiName: ApiName.add,
      relation1: ids.orgInfoId,
      // relation2: ids.orgAdmUserId,
    })
    ids.orgId = `${orgId}`

    // 添加一个 组织用户
    const { id: orgAdmUserId } = await requestByOption({
      username,
      password,
      ...relation.org.user,
      type: getOrgUniType('user', ids.orgId),
      apiName: ApiName.add,
    })
    ids.orgAdmUserId = `${orgAdmUserId}`

    // 将创建的 组织 关联到该组织用户
    await requestApi(relation.org.user.apiType, ApiName.edit, {
      id: ids.orgAdmUserId,
      relation2: ids.orgId,
    })

    // 将 管理员 关联到 该组织
    await requestApi(relation.org.entity.apiType, ApiName.edit, {
      id: ids.orgId,
      relation2: ids.orgAdmUserId,
    })

    return ids
  } catch (e) {
    // 防止垃圾每次创建失败 一堆垃圾数据
    if (ids.orgAdmUserId) {
      await requestByOption({
        ...relation.org.user,
        id: ids.orgAdmUserId,
        apiName: ApiName.del,
      })
    }

    if (ids.orgInfoId) {
      await requestByOption({
        ...relation.org.orgInfo,
        id: ids.orgInfoId,
        apiName: ApiName.del,
      })
    }

    if (ids.orgId) {
      await requestByOption({
        ...relation.org.entity,
        id: ids.orgId,
        apiName: ApiName.del,
      })
    }

    throw Error('创建组织失败')
  }
}

// 组织管理员 添加一个应用
export async function sysCreateAppApi(option: any) {
  const { username, password, ...rest } = option

  const ids = {
    appAdminId: '',
    appInfoId: '',
    appId: '',
  }

  const isIsolation = rest.isolation === '1'

  try {
    // 添加一个 应用 对应配置
    const { id: appInfoId } = await requestByOption({
      ...rest,
      ...relation.app.appInfo,
      apiName: ApiName.add,
    })
    ids.appInfoId = `${appInfoId}`

    // 创建一个应用， 并将 配置/用户 关联到该应用
    const { id: appId } = await requestByOption({
      ...relation.app.entity,
      apiName: ApiName.add,
      relation1: ids.appInfoId,
      relation2: getOrgId(),
    })
    ids.appId = `${appId}`

    if (isIsolation) {
      // 添加一个 应用用户
      const { id: appAdminId } = await requestByOption({
        username,
        password,
        ...relation.app.user,
        type: `${relation.org.user.type}_${ids.appId}`,
        apiName: ApiName.add,
      })
      ids.appAdminId = `${appAdminId}`

      // 将创建的 应用 关联到该应用管理员
      await requestApi(relation.app.user.apiType, ApiName.edit, {
        id: ids.appAdminId,
        relation2: ids.appId,
      })

      // 将 管理员 关联到 该应用
      await requestApi(relation.app.entity.apiType, ApiName.edit, {
        id: ids.appId,
        relation3: ids.appAdminId,
      })
    }

    return ids
  } catch (e) {
    // 防止垃圾每次创建失败 一堆垃圾数据
    if (ids.appAdminId) {
      await requestByOption({
        ...relation.app.user,
        id: ids.appAdminId,
        apiName: ApiName.del,
      })
    }

    if (ids.appInfoId) {
      await requestByOption({
        ...relation.app.appInfo,
        id: ids.appInfoId,
        apiName: ApiName.del,
      })
    }

    if (ids.appId) {
      await requestByOption({
        ...relation.app.entity,
        id: ids.appId,
        apiName: ApiName.del,
      })
    }

    throw Error('创建组织失败')
  }
}

// 平台管理员 查询 组织申请 列表
export function sysListOrgApplyReqOpt() {
  const reqOption = getReqOption({
    ...relation.sys.orgRegisterApply,
    apiName: ApiName.list,
    '&': '$$',
  })

  return reqOption
}

// 平台管理员 组织申请 审核 列表
export function sysListOrgApplyCheckReqOpt() {
  const reqOption = getReqOption({
    ...relation.sys.orgRegisterApply,
    apiName: ApiName.list,
    '&': '$$',
  })

  return reqOption
}

// 平台管理员 修改平台 信息
export function sysEditInfoReqOpt() {
  const reqOption = getReqOption({
    ...relation.sys.sysInfo,
    apiName: ApiName.edit,
    '&': '$$',
  })

  return reqOption
}
