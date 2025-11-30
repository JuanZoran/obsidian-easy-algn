export interface EasyAlignPluginSettings {
	trimWhitespace: boolean;
	addSpacesAroundDelimiter: boolean;
	useFullwidthSpaces: boolean;
}

export const DEFAULT_PLUGIN_SETTINGS: EasyAlignPluginSettings = {
	trimWhitespace: true,
	addSpacesAroundDelimiter: true,
	useFullwidthSpaces: false,
};
