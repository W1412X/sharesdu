import { dealAxiosError } from "@/utils/other";
import axiosInstance from "../request";

const postAgent = async (path, data) => {
  try {
    const response = await axiosInstance.post(path, data);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

export const agentCourseSearch = async (data) => postAgent('/agent/course/search', data);
export const agentCourseContext = async (data) => postAgent('/agent/course/context', data);
export const agentContentSearch = async (data) => postAgent('/agent/content/search', data);
export const agentThreadContext = async (data) => postAgent('/agent/thread/context', data);
export const agentStatsAggregate = async (data) => postAgent('/agent/stats/aggregate', data);

