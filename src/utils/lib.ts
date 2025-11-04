export function get_time(): string {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

export interface ConfigType {
  command_prefix: string;
  erpg_bot_id: string;
}
