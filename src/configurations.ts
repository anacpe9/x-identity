import { join } from 'path';
import { existsSync } from 'fs';
import * as mergeYaml from 'merge-yaml';

const YAML_BASE_CONFIG_FILENAME = 'config/setting.yaml';
const YAML_ENV_CONFIG_FILENAME = `config/setting.${process.env.NODE_ENV || 'development'}.yaml`;

// https://stackoverflow.com/questions/63462577/how-to-load-multiple-yaml-files-at-once-in-javascript
export default () => {
  const files = [YAML_BASE_CONFIG_FILENAME, YAML_ENV_CONFIG_FILENAME]
    .map((file) => join(__dirname, file))
    .filter((file) => existsSync(file));

  try {
    const cfg = mergeYaml(files) as Record<string, any>;

    // override config by environment
    // double underscore eq underscore
    // underscore eq dot
    // example: X_APP_X__Y_Z --> test.x_y.z
    const rawConfigPrefix = cfg.app?.config_prefix || 'X';
    const configPrefix = `${rawConfigPrefix}_`;
    const precessEnv = Object.entries(process.env);
    const envs = precessEnv.filter((ekv) => ekv[0].startsWith(configPrefix));
    for (const kv of envs) {
      const key = kv[0]
        .replace(configPrefix, '')
        .replace(/__/g, '//')
        .replace(/_/g, '.')
        .replace(/\/\//g, '_')
        .toLowerCase();
      const attrib = key.split('.');
      const cfgPth = _ensureConfigPath(cfg, key);
      const cfgAtr = attrib[attrib.length - 1];

      cfgPth[cfgAtr] = kv[1];
    }

    return cfg;
  } catch (err) {
    console.log('--- merge configuration files err ---');
    console.error(err);
  }
};

function _ensureConfigPath(cfg: Record<string, any>, dotConfigPath: string): Record<string, any> {
  const arr = dotConfigPath.split('.');
  arr.splice(arr.length - 1, 1);

  if (arr.length === 0) return cfg;

  return arr.reduce((currPth, attName, idx, arr) => {
    const isArray = idx < arr.length && !isNaN(+arr[idx + 1]);
    return currPth[attName] || (currPth[attName] = isArray ? [] : {});
  }, cfg);
}
