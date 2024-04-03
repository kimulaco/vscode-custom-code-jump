Namespace('jp.co.project.sub.content')
  .use('jp.co.project.main.logger')
  .define(function (ns) {
    ns.provide({
      createSubContent: () => {
        ns.jp.co.project.main.logger.info('create sub content');
      },
    });
  });
