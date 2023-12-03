import { Plugin, PluginID } from '@/types/plugin';

export const getEndpoint = (plugin: Plugin | null) => {
  return 'api/conv';
  return 'api/chat';
  // if (!plugin) {
  //   // return 'api/conv';
  //   return 'api/chat';
  // }

  // if (plugin.id === PluginID.GOOGLE_SEARCH) {
  //   return 'api/google';
  // }

  // // return 'api/conv';
  // return 'api/chat';
};
