console.log('REACT_APP_ENV', process.env.REACT_APP_ENV);
const defaultRoute = [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/jobs',
    routes: [
      {
        path: '/jobs',
        redirect: 'jobs-manage',
      },
      {
        path: '/jobs/jobs-manage',
        component: './Jobs/SysJobs/list',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/',
    component: './Welcome',
  },
  {
    path: '/404',
    hideInMenu: true,
    component: './404',
  },
  {
    component: './404',
  },
];

export default [...defaultRoute].filter(Boolean);
