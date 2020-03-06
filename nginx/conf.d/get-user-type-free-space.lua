local userType = ngx.shared.usertype

local free_page_bytes = userType:free_space()
local capacity = userType:capacity()


return ngx.say((capacity - free_page_bytes) / capacity * 100)