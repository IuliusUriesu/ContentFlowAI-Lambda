import defaultFunction from "./handlers/api/defaultFunction";
import createUserProfile from "./handlers/api/createUserProfile";
import createContentRequest from "./handlers/api/createContentRequest";
import getAllContentRequests from "./handlers/api/getAllContentRequests";
import getContentRequest from "./handlers/api/getContentRequest";
import getAllGeneratedContent from "./handlers/api/getAllGeneratedContent";
import getGeneratedContentPiece from "./handlers/api/getGeneratedContentPiece";
import editGeneratedContentPiece from "./handlers/api/editGeneratedContentPiece";
import editMarkedAsPosted from "./handlers/api/editMarkedAsPosted";
import getUserProfile from "./handlers/api/getUserProfile";
import writeBrandSummary from "./handlers/workers/writeBrandSummary";
import generateContent from "./handlers/workers/generateContent";

// API Handlers
exports.defaultFunction = defaultFunction;
exports.createUserProfile = createUserProfile;
exports.createContentRequest = createContentRequest;
exports.getAllContentRequests = getAllContentRequests;
exports.getContentRequest = getContentRequest;
exports.getAllGeneratedContent = getAllGeneratedContent;
exports.getGeneratedContentPiece = getGeneratedContentPiece;
exports.editGeneratedContentPiece = editGeneratedContentPiece;
exports.editMarkedAsPosted = editMarkedAsPosted;
exports.getUserProfile = getUserProfile;

// Worker Handlers
exports.writeBrandSummary = writeBrandSummary;
exports.generateContent = generateContent;
