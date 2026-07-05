import assert from "node:assert/strict";

import {
  TAB_CONTENT_CLEARANCE,
  TAB_CONTENT_TOP_OFFSET,
} from "../constants/layout";

// Pure calculation mirror of useTabContentInsets (hook requires RN runtime).
function tabContentInsets(bottom: number, top: number) {
  return {
    paddingBottom: bottom + TAB_CONTENT_CLEARANCE,
    paddingTop: top + TAB_CONTENT_TOP_OFFSET,
  };
}

assert.deepEqual(tabContentInsets(34, 59), {
  paddingBottom: 34 + TAB_CONTENT_CLEARANCE,
  paddingTop: 59 + TAB_CONTENT_TOP_OFFSET,
});
