local function getTTl(typeOfUser)
  return typeOfUser * 50
end

local function addUserToCache(userCacheKey, typeOfUser, red)
  red:init_pipeline(2)
  red:set(userCacheKey, "ok")
  red:expire(userCacheKey, getTTl(typeOfUser))
  local results, err = red:commit_pipeline()
end

local redis = require "resty.redis"
local red = redis:new()
local ok, err = red:connect("10.0.2.15", 6379)

if not ok then
    ngx.say("failed to connect: ", err)
    return
end

local userKey = ngx.var.cookie_USER_KEY

-- If no userkey then first time visitor. Allow them in ?

if not userKey then
  return ngx.say("User is a first time visitor")
end

local typeOfUser = 1
local userCacheKey = "key-" .. userKey

local ok, err = red:select(1)
local alreadyIn, err = red:get(userCacheKey)

if alreadyIn ~= ngx.null then
  addUserToCache(userCacheKey, typeOfUser, red)
 
  return ngx.say("User " .. userCacheKey .. " is already in ")
end

-- So, the user is not already in the site, shall we allow them access?

local currentlyIn, err = red:dbsize()
-- Get the type of user
local ok, err = red:select(0)
local typeOfUser, err = red:get(userCacheKey)

-- TODO: Update 500 to get capacity from redis
local capacity = 500
local fullRatio = currentlyIn / capacity
local weighting = (1 - fullRatio) * typeOfUser * 10

if currentlyIn == capacity or weighting < 0.3 then
  ngx.status = 503  
  ngx.say("User " .. userCacheKey .. " is denied access")  
  return ngx.exit(503) 
end

local ok, err = red:select(1)
addUserToCache(userCacheKey, typeOfUser, red)

ngx.say("DB Size is " .. currentlyIn .. " user type: " .. typeOfUser .. " user key " .. userKey .. " has been allowed access")

local ok, err = red:set_keepalive(10000, 100)