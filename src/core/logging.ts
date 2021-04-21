import { configure, getLogger } from 'log4js';

configure({
  appenders: {
    console: { 
      type: 'console', 
      layout: {
        type: 'pattern',
        pattern: '%[%f{1}:%l %p %m %]'
      }
    }
  },
  categories: {
    default: { 
      appenders: ['console'], 
      level: 'info'
    }
  }
});

export { getLogger };