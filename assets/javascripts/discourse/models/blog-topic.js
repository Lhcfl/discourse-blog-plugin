import EmberObject from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import Topic from "discourse/models/topic";
import User from "discourse/models/user";

const BlogTopic = EmberObject.extend({});

BlogTopic.reopenClass({
  list(params) {
    console.log("params::")
    console.log(params);

    return ajax(`/blog/${params.username}/t/${params.slug}/${params.id}.json`).then((data) => {
      const topic = Topic.create(data);
      topic.params = params;
      if (topic.post_stream) {
          topic.post_stream.posts = topic.post_stream?.posts.filter((post) => {
            this._initUserModels(post);
            if (post.post_number === 1) {
                topic.blogPost = post;
                topic.params.user = {
                  user: post
                }
                return false;
            }
            return true;
          });
      }
      return topic;
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

export default BlogTopic;