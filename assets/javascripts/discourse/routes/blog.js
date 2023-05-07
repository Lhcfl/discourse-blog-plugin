// import buildTopicRoute from "discourse/routes/build-topic-route";
// import { popupAjaxError } from 'discourse/lib/ajax-error';
import { ajax } from 'discourse/lib/ajax';
// import EmberObject from '@ember/object';
// import Blog from "../models/blog";

// export default buildTopicRoute('blog', {
//   // model(data, transition) {
//   //   this.params = data;
//   //   console.log(this._super(data, transition));
//   //   return this._super(data, transition);
//   // },
//   model(params, transition) {
//     console.log(params)
//     console.log(transition)
//     return Blog.list(params).then((result) => {
//       // this.controllerFor("docs.index").set("isLoading", false);
//       return result;
//     });
//   },
      
//   afterModel(model) {
//     console.log(model);
//     // model.topics.forEach((topic) => {
//     //   // eslint-disable-next-line no-unused-vars
//     //   const [tmp1, tmp2, slug, id] = topic.url.split('/');
//     //   console.log(topic.url)
//     //   console.log(`/blog/${this.params?.username}/${slug}/${id}`)
//     //   topic.set("url", `/blog/${this.params?.username}/${slug}/${id}`);
//     // })
//     // if (this.siteSettings.discourse_blog_sidebar_topic_list && !this.site.mobileView) {
//     //   const filter = this.siteSettings.discourse_blog_sidebar_topic_list_filter || 'latest';
//     //   return this.store.findFiltered("topicList", { filter })
//     //     .then(list => {
//     //       const limit = this.siteSettings.discourse_blog_sidebar_topic_list_limit || 10;
//     //       this.set('sidebarTopics', list.topics.slice(0, limit));
//     //     });
//     // } else {
//     //   return true;
//     // }
//   },
  
//   // renderTemplate() {
//   //   this.render("blog", {
//   //     controller: "discovery/topics",
//   //     outlet: "list-container"
//   //   });
//   // },
  
//   setupController(controller, model) {
//     controller.set("model", model);
//     // this._super(controller, model);
//   },
// });

import I18n from "I18n";

import DiscourseRoute from "discourse/routes/discourse";
import { action } from "@ember/object";

export default class extends DiscourseRoute {

  model(params) {
    console.log(params);
    console.log(this);
    const ret = this.store.findFiltered("topicList", {
      filter: "filter",
      params: {
        q: `categories:${this?.currentUser?.blog_category_slugs} created-by:@${params.username}`,
        username: params.username,
        is_blog: true,
      },
    });
    console.log(ret);
    return ret;
  }

  afterModel(model) {
    model.params.user =  {
      user: model?.topics?.get(0)?.creator
    }
    console.log("oh ok");
    console.log(model);
    model.topics.forEach((topic) => {
      topic.set("blogUrl", `/blog/${model.params.username}` + topic.url);
    });
  }

  titleToken() {
    console.log("this model");
    const model = this.modelFor("blog");
    console.log(model);
    return `${model.params.username}'s Blog`;
  }

  setupController(_controller, model) {
    this.controllerFor("discovery/topics").setProperties({ model });
  }

  renderTemplate() {
    // this.render("navigation/filter", { outlet: "navigation-bar" });

    this.render("blog", {
      controller: "discovery/topics",
      outlet: "list-container",
    });
  }

  // TODO(tgxworld): This action is required by the `discovery/topics` controller which is not necessary for this route.
  // Figure out a way to remove this.
  @action
  changeSort() {}
}