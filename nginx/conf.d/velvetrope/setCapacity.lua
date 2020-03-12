local capacity = ngx.var.capacity
local meta = ngx.shared.velvetrope_metadata

meta:set('capacity', capacity)