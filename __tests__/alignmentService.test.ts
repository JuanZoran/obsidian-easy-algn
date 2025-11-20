import type { AlignmentStore } from "../src/easyAlign/types";
import { AlignmentServiceImpl } from "../src/easyAlign/service";

describe("AlignmentServiceImpl", () => {
	const mockRules = [
		{ id: "rule-a", trigger: "ga", description: "Rule A" },
		{ id: "rule-b", trigger: "gb", description: "Rule B" },
	];

	let stubStore: AlignmentStore;
	let loadCalls = 0;

	beforeEach(() => {
		loadCalls = 0;
		stubStore = {
			loadRules: jest.fn(async () => {
				loadCalls += 1;
				return mockRules;
			}),
		};
	});

	it("loads rules from the store and exposes them", async () => {
		const service = new AlignmentServiceImpl(stubStore);
		await service.load();
		expect(loadCalls).toBe(1);

		const found = service.getRuleById("rule-b");
		expect(found).toMatchObject({ id: "rule-b", description: "Rule B" });
		expect(service.getAllRules()).toHaveLength(2);
	});

	it("returns undefined when rule id is unknown", async () => {
		const service = new AlignmentServiceImpl(stubStore);
		await service.load();
		expect(service.getRuleById("missing")).toBeUndefined();
	});
});
