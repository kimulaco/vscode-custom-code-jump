Namespace('jp.co.project.main.logger')
  .define(function (ns: any) {
    ns.provide({
      info: (message: string): void => {
        console.log(message)
      },
    });
  });
