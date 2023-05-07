import { withPluginApi } from "discourse/lib/plugin-api";
import {
  default as discourseComputed,
  on,
  observes,
} from "discourse-common/utils/decorators";
import { alias } from "@ember/object/computed";
import { findRawTemplate } from "discourse-common/lib/raw-templates";
import { wantsNewWindow } from "discourse/lib/intercept-click";
import { emojiUnescape } from "discourse/lib/text";
import { notEmpty } from "@ember/object/computed";
import { h } from "virtual-dom";
import { inject as service } from "@ember/service";
import { scheduleOnce } from "@ember/runloop";
import showModal from "discourse/lib/show-modal";
import TopicList from "discourse/models/topic-list";

export default {
  name: "blog-edits",
  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");

    if (!siteSettings.discourse_blog_enabled) return;

    withPluginApi("0.8.12", (api) => {
      // api.modifyClass('controller:discovery', {
      //   router: service(),

      //   @on('init')
      //   @observes('router.currentRouteName')
      //   toggleClass() {
      //     const route = this.get('router.currentRouteName');
      //     scheduleOnce('afterRender', () => {
      //       $('#list-area').toggleClass('blog', route === 'blog');
      //     });
      //   }
      // });

      // api.modifyClass('controller:discovery/topics', {
      //   actions: {
      //     refresh() {
      //       const route = this.get('router.currentRouteName');
      //       if (route === 'blog') return;
      //       return this._super();
      //     }
      //   }
      // });

      // TopicList.reopenClass({
      //   topicsFrom(store, result, opts) {
      //     console.log("wwww reopened");
      //     console.log(this);
      //     console.log(store);
      //     console.log(result);
      //     console.log(opts);
          
      //     if (!result) {
      //       return;
      //     }
      
      //     opts = opts || {};
      //     let listKey = opts.listKey || "topics";
      
      //     // Stitch together our side loaded data
      
      //     const users = extractByKey(result.users, User);
      //     const groups = extractByKey(result.primary_groups, EmberObject);
      
      //     return result.topic_list[listKey].map((t) => {
      //       t.posters.forEach((p) => {
      //         p.user = users[p.user_id];
      //         p.extraClasses = p.extras;
      //         if (p.primary_group_id) {
      //           p.primary_group = groups[p.primary_group_id];
      //           if (p.primary_group) {
      //             p.extraClasses = `${p.extraClasses || ""} group-${
      //               p.primary_group.name
      //             }`;
      //           }
      //         }
      //       });
      
      //       if (t.participants) {
      //         t.participants.forEach((p) => (p.user = users[p.user_id]));
      //       }
      
      //       return store.createRecord("topic", t);
      //     });
      //   },
      // });

      api.modifyClass('component:topic-list', {
        router: service(),
        currentRoute: alias('router.currentRouteName'),

        @discourseComputed('currentRoute')
        blogRoute(currentRoute) {
          return currentRoute === 'blog';
        },

        @on('didInsertElement')
        @observes('blogRoute')
        setupblog() {
          const blogRoute = this.get('blogRoute');
          if (blogRoute) {
            const blogCategoryId = this.siteSettings.discourse_blog_category;
            const blogCategory = this.site.get("categoriesList").find(c => c.id === blogCategoryId);
            this.set('category', blogCategory);
            $('body').addClass('blog');
            console.log(blogCategory)
          } else {
            $('body').removeClass('blog');
          }
        }
      });

      api.modifyClass('component:topic-list-item', {
        blogRoute: alias('parentView.blogRoute'),

        @observes("topic.pinned")
        renderTopicListItem() {
          if (this.get('blogRoute')) {
            const template = findRawTemplate("list/blog-item");
            if (template) {
              this.set("topicListItemContents", template(this).htmlSafe());
            }
          } else {
            return this._super();
          }
        },

        // @discourseComputed('blogRoute')
        // showReplies(blogRoute) {
        //   const siteSettings = this.siteSettings;
        //   const topicSource = siteSettings.discourse_blog_source === 'category';
        //   const showReplies = siteSettings.discourse_blog_show_reply_count;
        //   return blogRoute && topicSource && showReplies;
        // },

        // click(e) {
        //   let t = e.target;
        //   if (!t) {
        //     return this._super(e);
        //   }
        //   if (t.closest(".share")) {
        //     const controller = showModal("share-topic", {
        //       model: this.topic.category,
        //     });
        //     controller.set('topic', this.topic);
        //     return true;
        //   }
        //   return this._super(e);
        // },
      });

      // api.modifyClass('component:site-header', {
      //   router: service(),
      //   currentRoute: alias('router.currentRouteName'),

      //   @observes('currentRoute')
      //   rerenderWhenRouteChanges() {
      //     this.queueRerender();
      //   },

      //   buildArgs() {
      //     return $.extend(this._super(), {
      //       currentRoute: this.get('currentRoute')
      //     });
      //   }
      // });

      api.reopenWidget("header-buttons", {
        html(attrs) {
          let buttons = this._super(attrs) || [];
          let className = "header-nav-link blog";

          if (attrs.currentRoute === "blog") {
            className += " active";
          }

          let linkAttrs = {
            href: "/blog/lhcfl",
            label: "filters.blog.title",
            className,
          };

          const icon = siteSettings.discourse_blog_icon;
          if (icon && icon.indexOf("/") > -1) {
            linkAttrs["contents"] = () => {
              return [
                h("img", { attributes: { src: icon } }),
                h("span", I18n.t("filters.blog.title")),
              ];
            };
          } else if (icon) {
            linkAttrs["icon"] = icon;
          }

          buttons.unshift(this.attach("link", linkAttrs));

          return buttons;
        },
      });

      // api.modifyClass('model:topic', {
      //   @discourseComputed("blog_body")
      //   escapedblogBody(blogBody) {
      //     return emojiUnescape(blogBody);
      //   },

      //   @discourseComputed("category")
      //   basicCategoryLinkHtml(category) {
      //     return `<a class="basic-category-link"
      //                href="${category.url}"
      //                title="${category.name}">
      //               ${category.name}
      //             </a>`;
      //   }
      // });

      // api.modifyClass('controller:discovery/topics', {
      //   @discourseComputed('showSidebarTopics')
      //   showSidebar(showSidebarTopics) {
      //     return showSidebarTopics && !this.site.mobileView;
      //   },

      //   @discourseComputed('sidebarTopics')
      //   showSidebarTopics(sidebarTopics) {
      //     return sidebarTopics && siteSettings.discourse_blog_sidebar_topic_list;
      //   }
      // })
    });
  },
};
