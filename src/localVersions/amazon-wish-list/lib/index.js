/**
 * Local edited version, updated to the selectors.
 * Original repository: https://github.com/stylesuxx/amazon-wish-list
 * All credit belongs to original repository
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AmazonWishList = function () {
  function AmazonWishList() {
    var tld = arguments.length <= 0 || arguments[0] === undefined ? 'de' : arguments[0];

    _classCallCheck(this, AmazonWishList);

    this.baseUrl = ['https://amazon.', 'com'].join('');
    this.config = {
      profile: {
        url: [this.baseUrl, 'gp/profile/'].join('/')
      },
      lists: {
        url: [this.baseUrl, 'gp/registry/wishlist/?cid='].join('/'),
        selectors: {
          listLinks: '.wishlist-left-nav .g-left-nav-row a'
        }
      },
      list: {
        url: [this.baseUrl, 'gp/registry/wishlist/'].join('/'),
        selectors: {
          title: '#wl-list-info h1',
          pageLinks: '.a-pagination li:not(.a-selected, .a-last) a',
          items: '#g-items div.a-fixed-left-grid.a-spacing-none',
          itemTitle: 'h2.a-size-base',
          itemId: 'h2.a-size-base a',
          itemPriority: '.g-item-comment-row span span.a-hidden',
          itemComment: '.g-item-comment-row .g-comment-quote.a-text-quote',
          itemPriceText: '.price-section .a-color-price'
        }
      }
    };

    this.getProfileUrl = function (cid) {
      return [this.config.profile.url, cid].join('');
    };

    this.getListsUrl = function (cid) {
      return [this.config.lists.url, cid].join('');
    };

    this.getListUrl = function (id) {
      return [this.config.list.url, id].join('');
    };

    this.getItemUrl = function (id) {
      return [this.baseUrl, 'dp', id].join('/');
    };

    this.getPage = function (url) {
      var _this = this;

      var options = {
        uri: [this.baseUrl, url].join(''),
        transform: function transform(body) {
          return _cheerio2.default.load(body);
        }
      };

      return (0, _requestPromise2.default)(options).then(function ($) {
        return _this.getItems($);
      });
    };

    this.getItems = function ($, $items) {
      var _this2 = this;
      var selectors = _this2.config.list.selectors;

      return new Promise(function (resolve, reject) {
        var items = [];

        $items.each(function (index, element) {
          var title = $(selectors.itemTitle, element).text().trim();
          var id = $(selectors.itemId, element).attr('href').split('/')[2];
          var link = _this2.getItemUrl(id);
          var priority = parseInt($(selectors.itemPriority, element).text().trim()) | 0;
          var comment = $(selectors.itemComment, element).text().trim();
          var priceText = $(selectors.itemPriceText, element).text().trim();
          var currency = 'N/A';
          var price = 'N/A';
          if (priceText) {
            priceText = priceText.replace('.', '').trim();
            priceText = priceText.replace(',', '.').trim();
            var re = /(\D*)(.*)/;
            var result = re.exec(priceText);

            if (result.length < 3) {
              reject('Could not parse item price.');
            }

            currency = result[1].trim();
            price = parseFloat(parseFloat(result[2]).toFixed(2));
          }

          items.push({
            id: id,
            title: title,
            link: link,
            priority: priority,
            comment: comment,
            currency: currency,
            price: price
          });
        });

        resolve(items);
      });
    };
  }

  _createClass(AmazonWishList, [{
    key: 'getByCid',
    value: function getByCid(cid) {
      var _this3 = this;

      var filter = arguments.length <= 1 || arguments[1] === undefined ? 'unpurchased' : arguments[1];
      var sort = arguments.length <= 2 || arguments[2] === undefined ? 'date' : arguments[2];

      var options = { uri: this.getProfileUrl(cid) };

      return (0, _requestPromise2.default)(options).then(function () {
        var options = {
          uri: _this3.getListsUrl(cid),
          transform: function transform(body) {
            return _cheerio2.default.load(body);
          }
        };

        return (0, _requestPromise2.default)(options);
      }).then(function ($) {
        var promises = [];
        var lists = [];

        var $lists = $(_this3.config.lists.selectors.listLinks);
        $lists.each(function (index, item) {
          var url = $(item).attr('href');
          var id = url.split('/')[4];

          promises.push(_this3.getById(id, filter, sort));
        });

        return Promise.all(promises).then(function (responses) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = responses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var response = _step.value;

              lists.push(response);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          return new Promise(function (resolve, reject) {
            return resolve(lists);
          });
        });
      });
    }
  }, {
    key: 'getById',
    value: function getById(id) {
      var _this4 = this;

      var filter = arguments.length <= 1 || arguments[1] === undefined ? 'unpurchased' : arguments[1];
      var sort = arguments.length <= 2 || arguments[2] === undefined ? 'date' : arguments[2];

      var selectors = this.config.list.selectors;
      var options = {
        uri: this.getListUrl(id),
        qs: {
          reveal: filter,
          sort: sort !== 'priority' ? 'universal-' + sort : sort
        },
        transform: function transform(body) {
          return _cheerio2.default.load(body);
        }
      };

      return fetch(options.uri).then(res => res.text()).then(text => Promise.resolve(options.transform(text))).then(function ($) {
        var promises = [];
        var selectors = _this4.config.list.selectors;
        var list = {
          title: $(selectors.title).text().trim(),
          id: id,
          items: []
        };

        /* Initial Page */
        var $items = $(selectors.items);
        promises.push(_this4.getItems($, $items));

        /* Following pages */
        var $pages = $(selectors.pageLinks);
        $pages.each(function (index, element) {
          var url = $(element).attr('href');

          promises.push(_this4.getPage(url));
        });

        return Promise.all(promises).then(function (responses) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = responses[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var response = _step2.value;

              list.items = list.items.concat(response);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          return new Promise(function (resolve, reject) {
            return resolve(list);
          });
        });
      });
    }
  }]);

  return AmazonWishList;
}();

exports.default = AmazonWishList;