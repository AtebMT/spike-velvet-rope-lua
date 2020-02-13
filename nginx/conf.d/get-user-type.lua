local userKey = ngx.var.userKey
local usertypecache = ngx.shared.usertype

local result, err = usertypecache:get(userKey)

if err then
  ngx.status = 500  
  ngx.say("Error: " .. err)  
  return ngx.exit(500) 
end

if not result then
  return ngx.say("No value for userKey " .. userKey)
end

return ngx.say("User " .. userKey .. " is of type " .. result)
