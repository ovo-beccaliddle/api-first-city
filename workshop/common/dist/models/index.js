"use strict";
/**
 * Common data models used across city services
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.Priority = void 0;
/**
 * Priority levels for various city services
 */
var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
    Priority["CRITICAL"] = "critical";
})(Priority || (exports.Priority = Priority = {}));
/**
 * Status for various city resources
 */
var Status;
(function (Status) {
    Status["ACTIVE"] = "active";
    Status["INACTIVE"] = "inactive";
    Status["PENDING"] = "pending";
    Status["COMPLETED"] = "completed";
})(Status || (exports.Status = Status = {}));
//# sourceMappingURL=index.js.map