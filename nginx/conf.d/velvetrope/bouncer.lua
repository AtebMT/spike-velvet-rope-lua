local _M = {}

local function getTTl(typeOfUser)
  return typeOfUser * 50
end

local function addUserToCache(userKey, typeOfUser, cache, metadatacache)
  cache:set(userKey, 'ok', getTTl(typeOfUser))
  metadatacache:incr('allowed', 1, 0)
end

local function checkAccess()
  local lookupDomains = require "velvetrope/lookupDomains"
  local domain = lookupDomains.getDomainAbbreviation(ngx.var.host) or 'uk'

  local velvetrope = ngx.shared['velvetrope_' .. domain]
  local metadatacache = ngx.shared.velvetrope_metadata

  local userKey = ngx.var.cookie__integrationLdkey
  -- If no userkey then first time visitor. Allow them in ?
  if not userKey then
    return ngx.OK
  end

  -- Get the type of user
  local typeOfUser = ngx.var.cookie_userContext or 1
  local alreadyIn = velvetrope:get(userKey) 

  if alreadyIn ~= nil then
    addUserToCache(userKey, typeOfUser, velvetrope, metadatacache)
  
    return ngx.OK
  end

  -- So, the user is not already in the site, shall we allow them access?

  local capacity = metadatacache:get('capacity') or 5000

  local currentlyIn = metadatacache:get("all_num_users")
  
  local fullRatio = currentlyIn / capacity
  local weighting = (1 - fullRatio) * typeOfUser * 10
  
  local bouncerDisabled = metadatacache:get("disabled") or false

  if bouncerDisabled == false and (currentlyIn == capacity or weighting < 0.3) then
    metadatacache:incr('denied', 1, 0)
    ngx.status = 503
    ngx.print('Disallowed request')
    return ngx.exit(ngx.OK) 
  end

  addUserToCache(userKey, typeOfUser, velvetrope, metadatacache)

  return ngx.OK
end

_M.checkAccess = checkAccess

return _M
