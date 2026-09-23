import { api } from "./api";
import { mockRecommend, type MockMode } from "./mocks";
import type { RecommendRequest, RecommendResponse } from "./types";

export function recommend(req: RecommendRequest, mockMode: MockMode = "auto") {
  return api.post<RecommendResponse>("/recommend", req, () => mockRecommend(req, mockMode));
}
