local function getTTl(typeOfUser)
  return typeOfUser * 50
end

local function updateUserInCache(userCacheKey, typeOfUser, cache)
  cache:replace(userCacheKey, 'ok', getTTl(typeOfUser))
end

local function addUserToCache(userCacheKey, typeOfUser, cache)
  cache:set(userCacheKey, 'ok', getTTl(typeOfUser))
end


local velvetrope = ngx.shared.velvetrope
local usertypecache = ngx.shared.usertype

local userKey = ngx.var.cookie_USER_KEY

-- If no userkey then first time visitor. Allow them in ?

if not userKey then
  return ngx.exit(ngx.OK)
end

local typeOfUser = 1
local userCacheKey = "key-" .. userKey
local alreadyIn = velvetrope:get(userCacheKey) 

if alreadyIn ~= nil then
  updateUserInCache(userCacheKey, typeOfUser, velvetrope)
 
  return ngx.exit(ngx.OK)
end

-- So, the user is not already in the site, shall we allow them access?

-- In future, can get the capacity from the dictionary.
local capacity = 500
local keys, err = velvetrope:get_keys(capacity)

if err then
  -- What else can we do here? Can't get the dict size. Best allow people in I guess?
  return ngx.exit(ngx.OK)
end

local currentlyIn = table.getn(keys)

-- Get the type of user
local typeOfUser, err = usertypecache:get(userCacheKey)

if not typeOfUser then
  typeOfUser = 1
end

local fullRatio = currentlyIn / capacity
local weighting = (1 - fullRatio) * typeOfUser * 10

if currentlyIn == capacity or weighting < 0.3 then
  return ngx.exit(ngx.HTTP_SERVICE_UNAVAILABLE) 
end

addUserToCache(userCacheKey, typeOfUser, velvetrope)

return ngx.exit(ngx.OK)