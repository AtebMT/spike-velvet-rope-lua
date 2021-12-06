local _M = {}

local function instrumentUsers()
  local lookupDomains = require "velvetrope/lookupDomains"
  local domain = lookupDomains.getDomainAbbreviation(ngx.var.host)

  if domain ~= nil then
    local velvetrope = ngx.shared['velvetrope_' .. domain]

    local userKey = ngx.var.cookie_USER_KEY

    if not userKey then
      return ngx.OK
    end

    velvetrope:set(userKey, 'ok', 120)
  end

  return ngx.OK
end

_M.instrument = instrumentUsers

return _M