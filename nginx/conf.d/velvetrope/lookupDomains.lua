local _M = {}
local lookup = {}

lookup['www.findmypast.co.uk'] = 'uk'
lookup['localhost'] = 'uk'

local function getDomainAbbreviation(domain)
  return lookup[domain]
end

_M.getDomainAbbreviation = getDomainAbbreviation;

return _M