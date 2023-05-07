import { cancel, schedule } from "@ember/runloop";
import discourseLater from "discourse-common/lib/later";
import DiscourseRoute from "discourse/routes/discourse";
import DiscourseURL from "discourse/lib/url";
import { ID_CONSTRAINT } from "discourse/models/topic";
import { action, get } from "@ember/object";
import { isEmpty } from "@ember/utils";
import { inject as service } from "@ember/service";
import { setTopicId } from "discourse/lib/topic-list-tracker";
import showModal from "discourse/lib/show-modal";
import {ajax} from "discourse/lib/ajax";
import TopicFlag from "discourse/lib/flag-targets/topic-flag";
import PostFlag from "discourse/lib/flag-targets/post-flag";
import BlogTopic from "../models/blog-topic";

const SCROLL_DELAY = 500;

const BlogTopicRoute = DiscourseRoute.extend({
  composer: service(),
  screenTrack: service(),

  // scheduledReplace: null,
  // lastScrollPos: null,
  isTransitioning: false,

  redirect() {
    return this.redirectIfLoginRequired();
  },

  titleToken() {
    const model = this.modelFor("blog-topic");
    console.log("titletoken");
    if (model) {
      if (model.get("errorHtml")) {
        return model.get("errorTitle");
      }

      const result = model.get("unicode_title") || model.get("title"),
        cat = model.get("category");

      // Only display uncategorized in the title tag if it was renamed
      if (
        this.siteSettings.topic_page_title_includes_category &&
        cat &&
        !(
          cat.get("isUncategorizedCategory") &&
          cat.get("name").toLowerCase() === "uncategorized"
        )
      ) {
        let catName = cat.get("name");

        const parentCategory = cat.get("parentCategory");
        if (parentCategory) {
          catName = parentCategory.get("name") + " / " + catName;
        }
        console.log([result, catName]);
        return [result, catName];
      }
      console.log(result);
      return result;
    }
  },

  @action
  didTransition() {
    const controller = this.controllerFor("topic");
    controller._showFooter();
    const topicId = controller.get("model.id");
    setTopicId(topicId);
    return true;
  },

  @action
  willTransition(transition) {
    this._super(...arguments);
    cancel(this.scheduledReplace);
    this.set("isTransitioning", true);
    transition.catch(() => this.set("isTransitioning", false));
    return true;
  },

  // replaceState can be very slow on Android Chrome. This function debounces replaceState
  // within a topic until scrolling stops
  // _replaceUnlessScrolling(url) {
  //   const currentPos = parseInt($(document).scrollTop(), 10);
  //   if (currentPos === this.lastScrollPos) {
  //     DiscourseURL.replaceState(url);
  //     return;
  //   }

  //   this.setProperties({
  //     lastScrollPos: currentPos,
  //     scheduledReplace: discourseLater(
  //       this,
  //       "_replaceUnlessScrolling",
  //       url,
  //       SCROLL_DELAY
  //     ),
  //   });
  // },

  setupParams(topic, params) {
    // const postStream = topic.get("postStream");
    // postStream.set("filter", get(params, "filter"));

    // const usernames = get(params, "username_filters"),
    //   userFilters = postStream.get("userFilters");

    // userFilters.clear();
    // if (!isEmpty(usernames) && usernames !== "undefined") {
    //   userFilters.addObjects(usernames.split(","));
    // }

    return topic;
  },


  model(params, transition) {
    console.log(params)
    console.log(transition)
    return BlogTopic.list(params).then((result) => {
      // this.controllerFor("docs.index").set("isLoading", false);
      return result;
    });
  },

  // model(params, transition) {
  //   if (params.slug.match(ID_CONSTRAINT)) {
  //     transition.abort();

  //     DiscourseURL.routeTo(`/blog/${params.username}/${params.slug}/${params.id}`, {
  //       replaceURL: true,
  //     });

  //     return;
  //   }

  //   const queryParams = transition.to.queryParams;

  //   let topic = this.modelFor("topic");
  //   if (topic && topic.get("id") === parseInt(params.id, 10)) {
  //     this.setupParams(topic, queryParams);
  //     return topic;
  //   }
  // },

  renderTemplate() {
    console.log("wwwww");
    console.log(this);
    this.render("blog-topic", {
      // controller: "topic",
      outlet: "list-container"
    });
  },

  // activate() {
  //   this._super(...arguments);
  //   this.set("isTransitioning", false);

  //   const topic = this.modelFor("topic");
  //   // this.session.set("lastTopicIdViewed", parseInt(topic.get("id"), 10));
  // },

  // deactivate() {
  //   this._super(...arguments);

  //   // this.searchService.set("searchContext", null);

  //   const topicController = this.controllerFor("topic");
  //   const postStream = topicController.get("model.postStream");

  //   // postStream.cancelFilter();

  //   topicController.set("multiSelect", false);
  //   this.composer.set("topic", null);
  //   this.screenTrack.stop();

  //   this.appEvents.trigger("header:hide-topic");

  //   this.controllerFor("topic").set("model", null);
  // },

  setupController(controller, model) {

    // this.searchService.set("searchContext", model.get("searchContext"));

    // close the multi select when switching topics
    // controller.set("multiSelect", false);
    controller.get("quoteState")?.clear();
    
    this.composer.set("topic", model);
    
    controller.set("topic", model);
    controller.set("model", model);
    
    console.log("controller")
    console.log(controller)
    // this.topicTrackingState.trackIncoming("all");

    // We reset screen tracking every time a topic is entered
    // this.screenTrack.start(model.get("id"), controller);

    // schedule("afterRender", () =>
    //   this.appEvents.trigger("header:update-topic", model)
    // );
  },
});

export default BlogTopicRoute;