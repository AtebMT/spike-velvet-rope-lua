local userKey = ngx.var.userKey
local typeOfUser = ngx.var.typeOfUser
local usertypecache = ngx.shared.usertype

local function add(userKey, typeOfUser)  
  local success, err = usertypecache:set(userKey, typeOfUser)
  
  if not success then
      ngx.status = 500
      ngx.say("Error: " .. err)
      return ngx.exit(500)
  end
  
  local keys, err = usertypecache:get_keys(1000)
  
  if err then
    ngx.status = 500
    ngx.say(err)
    return ngx.exit(500)
  end
  
  local res = usertypecache:get(userKey)
  
  return res
end
  
-- local success, err = usertypecache:set(userKey, typeOfUser)
local success, err = ngx.timer.at(0,add,userKey, typeOfUser)

if not success then
  ngx.status = 500  
  ngx.say("Error: " .. err)  
  return ngx.exit(500) 
end

local keys, err = usertypecache:get_keys(1000)

if err then
  ngx.status = 500  
  ngx.say(err)
  return ngx.exit(500) 
end

local res = usertypecache:get(userKey)

return ngx.say("OK!!!! " .. table.getn(keys) .. " users in the cache " .. userKey .. " - " .. typeOfUser)
