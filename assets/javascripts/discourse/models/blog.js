import EmberObject from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import Topic from "discourse/models/topic";
import User from "discourse/models/user";

const Blog = EmberObject.extend({});

Blog.reopenClass({
  list(params) {
    console.log("params::");
    console.log(params);

    return ajax(`/blog/${params.username}.json`).then((data) => {
      console.log("Oh fuck")
      console.log(data);
      data.topic_list.topics = data.topic_list.topics.map(
        (topic) => Topic.create(topic)
      );
      console.log(data);
      return data;
    });
  },

  //   loadMore(loadMoreUrl) {
  //     return ajax(loadMoreUrl).then((data) => {
  //       data.topics.topic_list.topics = data.topics.topic_list.topics.map(
  //         (topic) => Topic.create(topic)
  //       );
  //       return data;
  //     });
  //   },

  _initUserModels(post) {
    if (post.mentioned_users) {
      post.mentioned_users = post.mentioned_users.map((u) => User.create(u));
    }
  },
});

export default Blog;
