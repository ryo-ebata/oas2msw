import { faker } from "@faker-js/faker";
import { type HttpHandler, HttpResponse, http } from "msw";

// Handler 1 - GET /users
const handler0: HttpHandler = http.get("/users", () => {
	// エラーレスポンスの生成（0.05の確率）
	const errorSchemas = [{ status: 400 }, { status: 500 }];
	if (errorSchemas.length > 0 && Math.random() < 0.05) {
		const error = errorSchemas[Math.floor(Math.random() * errorSchemas.length)];
		return HttpResponse.json(
			{
				statusCode: error.status,
				message: "Error response",
			},
			{ status: error.status },
		);
	}

	// 成功レスポンスの生成
	const mockData = generateMockData();
	return HttpResponse.json(mockData);
});

// Handler 2 - POST /users
const handler1: HttpHandler = http.post("/users", () => {
	// エラーレスポンスの生成（0.05の確率）
	const errorSchemas = [];
	if (errorSchemas.length > 0 && Math.random() < 0.05) {
		const error = errorSchemas[Math.floor(Math.random() * errorSchemas.length)];
		return HttpResponse.json(
			{
				statusCode: error.status,
				message: "Error response",
			},
			{ status: error.status },
		);
	}

	// 成功レスポンスの生成
	const mockData = {};
	return HttpResponse.json(mockData);
});

// Handler 1 - GET /users/{id}
const handler0: HttpHandler = http.get("/users/:id", () => {
	// エラーレスポンスの生成（0.05の確率）
	const errorSchemas = [{ status: 404 }];
	if (errorSchemas.length > 0 && Math.random() < 0.05) {
		const error = errorSchemas[Math.floor(Math.random() * errorSchemas.length)];
		return HttpResponse.json(
			{
				statusCode: error.status,
				message: "Error response",
			},
			{ status: error.status },
		);
	}

	// 成功レスポンスの生成
	const mockData = generateMockData();
	return HttpResponse.json(mockData);
});

export const handlers: HttpHandler[] = [handler0, handler1, handler0];
