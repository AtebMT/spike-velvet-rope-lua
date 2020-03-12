local _M = {}
local lookup = {}

lookup['www.findmypast.com'] = 'us'
lookup['www.findmypast.co.uk'] = 'uk'
lookup['www.findmypast.ie'] = 'uk'
lookup['www.findmypast.com.au'] = 'uk'
lookup['localhost'] = 'uk'

local function getDomainAbbreviation(domain)
  return lookup[domain]
end

_M.getDomainAbbreviation = getDomainAbbreviation;

return _M