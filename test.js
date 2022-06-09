const {OneBot, ImplConfig, DefaultHandler} = require('./lib')
const ob = new OneBot({
    impl: "idr",
    platform: "telegram",
    self_id: "114514",
    config: ImplConfig.Default,
    action_handler: new DefaultHandler()
})

ob.run()
