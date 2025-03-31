import defaultFunction from "./handlers/api/defaultFunction";
import createUserProfile from "./handlers/api/createUserProfile";
import createContentRequest from "./handlers/api/createContentRequest";
import getAllContentRequests from "./handlers/api/getAllContentRequests";
import writeBrandSummary from "./handlers/workers/writeBrandSummary";
import generateContent from "./handlers/workers/generateContent";

// API Handlers
exports.defaultFunction = defaultFunction;
exports.createUserProfile = createUserProfile;
exports.createContentRequest = createContentRequest;
exports.getAllContentRequests = getAllContentRequests;

// Worker Handlers
exports.writeBrandSummary = writeBrandSummary;
exports.generateContent = generateContent;
