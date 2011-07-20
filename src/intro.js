/**
 * Copyleft 2010-2011 Jay and Han (laughinghan@gmail.com)
 *   under the GNU Lesser General Public License
 *     http://www.gnu.org/licenses/lgpl.html
 * Project Website: http://mathquill.com
 */

(function() {

var $ = jQuery,
  undefined,
  _, //temp variable of prototypes
  isIE7 = $.browser.msie && (parseInt($.browser.version) == 7), // Browser sniffing
  isIE8 = $.browser.msie && (parseInt($.browser.version) == 8),
  jQueryDataKey = '[[mathquill internal data]]';

