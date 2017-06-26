export default {
  'port': 3000,
  'proxyServerPort': 3001,
  'ssl': {
    'activate': true,
    'key': `${__dirname}/../resources/.ssh/server.key`,
    'cert': `${__dirname}/../resources/.ssh/server.crt`
  }
}