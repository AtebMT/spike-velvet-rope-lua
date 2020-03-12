local state = ngx.var.state
local meta = ngx.shared.velvetrope_metadata

meta:set('disabled', state == 'disable')