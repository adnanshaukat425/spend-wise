import {
  TAB_CONTENT_CLEARANCE,
  TAB_CONTENT_TOP_OFFSET,
} from "@/constants/layout";

import { useScreenInsets } from "./useScreenInsets";

export function useTabContentInsets() {
  const insets = useScreenInsets();

  return {
    paddingBottom: insets.bottom + TAB_CONTENT_CLEARANCE,
    paddingTop: insets.top + TAB_CONTENT_TOP_OFFSET,
  };
}
