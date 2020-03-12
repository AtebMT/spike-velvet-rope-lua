local domain = ngx.var.domain
local meta = ngx.shared.velvetrope_metadata

if domain == nil then
    return ngx.say(meta:get('all_num_users'))
end

return ngx.say(meta:get(domain .. '_num_users'))
