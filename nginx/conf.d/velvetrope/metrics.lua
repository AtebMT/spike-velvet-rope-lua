local domain = ngx.var.domain
local meta = ngx.shared.velvetrope_metadata
local environment = 'local'

local function generateNumberOfUsersMetric(domain, environment) 
    return string.format("velvet_rope_number_of_users_gauge{domain=\"%s\",environment=\"%s\",job=\"velvetrope\"} %u \n", domain, environment, meta:get(domain .. '_num_users'))
end

local function generateCapacityMetric(environment)
    return string.format("velvet_rope_capacity_gauge{environment=\"%s\",job=\"velvetrope\"} %u \n", environment, meta:get('capacity'))
end

local function generateNumberOfUserRequestsMetric(access, environment)
    return string.format("velvet_rope_requests_total{access=\"%s\",environment=\"%s\",job=\"velvetrope\"} %u \n", access, environment, meta:get(access))
end

local function generateVelvetRopeDisabledMetric(environment)
    return string.format("velvet_rope_disabled_gauge{environment=\"%s\",job=\"velvetrope\"} %s \n", environment, meta:get('disabled'))
end

return ngx.say(
    "# HELP velvet_rope_number_of_users_gauge Current number of users recorder by velvet rope by domain\n"
    .. "# TYPE velvet_rope_number_of_users_gauge gauge\n"
    .. generateNumberOfUsersMetric('all', environment)
    .. generateNumberOfUsersMetric('uk', environment)
    .. generateNumberOfUsersMetric('us', environment)
    .. generateNumberOfUsersMetric('ie', environment)
    .. generateNumberOfUsersMetric('au', environment)
    .. "# HELP velvet_rope_capacity_gauge Current capacity of the velvet rope\n"
    .. "# TYPE velvet_rope_capacity_gauge gauge\n"
    .. generateCapacityMetric(environment)
    .. "# HELP velvet_rope_requests_total Current requests to the velvet rope\n"
    .. "# TYPE velvet_rope_requests_total counter\n"
    .. generateNumberOfUserRequestsMetric('denied', environment)
    .. generateNumberOfUserRequestsMetric('allowed', environment)
    .. "# HELP velvet_rope_disabled_gauge Current disabled status of the velvet rope\n"
    .. "# TYPE velvet_rope_disabled_gauge gauge\n"
    .. generateVelvetRopeDisabledMetric(environment)
)
