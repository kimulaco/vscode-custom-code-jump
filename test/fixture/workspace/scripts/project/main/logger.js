Namespace('jp.co.project.main.logger')
  .define(function (ns) {
    ns.provide({
      info: (message) => {
        console.log(message)
      },
    });
  });
