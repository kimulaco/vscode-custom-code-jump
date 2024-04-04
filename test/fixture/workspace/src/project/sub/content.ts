Namespace('jp.co.project.sub.content')
  .use('jp.co.project.main.logger')
  .use('jp.co.project.main.tracking')
  .use('jp.co.project.not.found')
  .define(function (ns: any) {
    ns.provide({
      createSubContent: () => {
        ns.jp.co.project.main.logger.info('create sub content');
      },
    });
  });
