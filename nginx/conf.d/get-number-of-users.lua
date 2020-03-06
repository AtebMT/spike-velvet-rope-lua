local lookupDomains = require "lookup_domains"
local domain = lookupDomains.getDomainAbbreviation(ngx.var.host)

if domain ~= nil then
  local velvetrope = ngx.shared['velvetrope_' .. domain]
  local keys, err = velvetrope:get_keys(0)

  if err then
    return ngx.say('Unable to read user cache ' .. err)
  end

  local currentlyIn = #keys

  return ngx.say(currentlyIn .. " users. " .. ngx.var.host ..)
end

return ngx.say('Unknown domain ' .. ngx.var.host)
