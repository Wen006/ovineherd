import React from 'react'

import { Amis } from '@core/components/amis/schema'

import Section from '~/components/section'

import * as S from './styled'

export default () => {
  const tableSchema = {
    type: 'crud',
    data: {
      items: [
        {
          id: 123,
        },
      ],
    },
    filterTogglable: false,
    perPageAvailable: [50, 100, 200],
    defaultParams: {
      size: 50,
    },
    perPageField: 'size',
    pageField: 'page',
    headerToolbar: ['$preset.forms.filter', '$preset.actions.add'],
    footerToolbar: ['statistics', 'switch-per-page', 'pagination'],
    columns: [
      {
        name: 'id',
        label: 'ID',
        type: 'text',
        width: 40,
      },
      {
        name: 'name',
        label: '姓名',
        type: 'text',
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'text',
      },
      {
        name: 'leader',
        label: '管理员',
        type: 'text',
      },
      {
        name: 'department',
        label: '所属部门',
        type: 'text',
      },
      {
        name: 'desc',
        label: '成员描述',
        type: 'text',
      },
      {
        name: 'createTime',
        label: '添加时间',
        type: 'datetime',
        width: 150,
      },
      {
        type: 'operation',
        label: '操作',
        width: 80,
        buttons: ['$preset.actions.edit', '$preset.actions.member', '$preset.actions.remove'],
      },
    ],
    preset: {
      actions: {
        add: {
          type: 'action',
          align: 'right',
          label: '添加角色',
          level: 'primary',
          icon: 'iconfont icon-plus pull-left',
        },
        edit: {
          type: 'action',
          iconOnly: true,
          tooltip: '编辑',
          icon: 'iconfont icon-edit',
        },
        member: {
          type: 'action',
          iconOnly: true,
          tooltip: '成员管理',
          icon: 'fa fa-user-o',
        },
        remove: {
          type: 'action',
          iconOnly: true,
          tooltip: '删除',
          icon: 'iconfont icon-close text-danger',
        },
      },
      forms: {
        filter: {
          type: 'form',
          wrapWithPanel: false,
          mode: 'inline',
          controls: [
            {
              type: 'text',
              name: 'keywords',
              placeholder: '请输入 ID/名称/邮箱 搜索',
              addOn: {
                iconOnly: true,
                icon: 'iconfont icon-ai-search',
                type: 'submit',
              },
            },
          ],
        },
      },
    },
  }

  return (
    <S.StyledRole>
      <h5 className="m-b-md">角色管理</h5>
      <Section title="角色列表" headerClassName="m-b-sm">
        <Amis schema={tableSchema} />
      </Section>
    </S.StyledRole>
  )
}
